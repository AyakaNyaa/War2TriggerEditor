use contracts::CommandSpec;

pub fn enrich(mut catalog: Vec<CommandSpec>) -> Vec<CommandSpec> {
    let metadata: serde_json::Value =
        serde_json::from_str(include_str!("../../../schemas/commands/legacy-groups.json"))
            .expect("audited menu groups");
    const GROUPS: [&str; 13] = [
        "conditions",
        "units",
        "values",
        "players",
        "mission",
        "presentation",
        "construction",
        "mechanics",
        "abilities",
        "special",
        "world",
        "campaign",
        "advanced",
    ];
    for spec in &mut catalog {
        let group = metadata["groups"]
            .as_object()
            .unwrap()
            .iter()
            .find_map(|(group, values)| {
                values
                    .as_array()
                    .unwrap()
                    .iter()
                    .any(|value| value.as_u64() == Some(spec.opcode.into()))
                    .then(|| group.parse::<usize>().unwrap())
            });
        spec.group = GROUPS[group.unwrap_or(12)].into();
        if matches!(spec.opcode, 120) {
            spec.group = "mission".into();
        }
        if matches!(spec.opcode, 122 | 123) {
            spec.group = "campaign".into();
        }
        spec.stage = if metadata["preload"]
            .as_array()
            .unwrap()
            .iter()
            .any(|value| value.as_u64() == Some(spec.opcode.into()))
        {
            "preload"
        } else {
            "cycle"
        }
        .into();
        spec.kind = if matches!(spec.opcode, 22 | 23 | 33 | 125 | 126) {
            "structure"
        } else if matches!(spec.opcode, 8 | 35 | 44 | 45 | 47 | 72 | 117) {
            "condition"
        } else if matches!(spec.opcode, 1 | 2 | 29 | 120 | 122 | 123) || spec.stage == "preload" {
            "setting"
        } else {
            "action"
        }
        .into();
    }
    catalog
}
