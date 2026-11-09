pub type FieldLayout = (usize, usize, &'static str, u32);

pub fn layout(bytes: &[u8]) -> Vec<FieldLayout> {
    let mut fields = vec![(1, 1, "operation", 27)];
    fields.extend(match bytes[1] {
        0 => vec![(2, 1, "unit", 110)],
        2 => vec![
            (2, 1, "stat", 151),
            (3, 2, "value", 65535),
            (5, 1, "comparison", 5),
        ],
        3 => vec![(2, 1, "stat", 151), (3, 2, "value", 65535)],
        6 | 19 => vec![(2, 1, "value", 255)],
        8 => vec![(2, 1, "x", 127), (3, 1, "y", 127)],
        9 => vec![(2, 1, "player", 15)],
        10 | 13 => vec![(2, 2, "value", 65535)],
        12 => vec![(2, 1, "order", 60), (3, 1, "x", 127), (4, 1, "y", 127)],
        15..=17 => vec![(2, 1, "resource", if bytes[1] == 15 { 1 } else { 2 })],
        18 => vec![(2, 1, "playerMask", 255), (3, 1, "value", 9)],
        20 | 21 => vec![(2, 1, "effect", 28)],
        22 => vec![
            (2, 1, "stat", 151),
            (3, 1, "variable", 255),
            (4, 1, "comparison", 5),
        ],
        23 => vec![(2, 2, "sound", 65535)],
        24 => vec![(2, 1, "player", 15), (3, 1, "enabled", 1)],
        25 => vec![(2, 2, "value", 65535), (4, 1, "player", 15)],
        27 => vec![(2, 1, "variableX", 255), (3, 1, "variableY", 255)],
        _ => Vec::new(),
    });
    fields
}
