fn main() {
    #[cfg(feature = "gui")]
    {
        tauri_build::build();
        // Tauri emits machine-owned JSON schemas. Keep their complete data,
        // using standard compact JSON so the project-wide 500-line limit holds.
        let schemas = std::path::Path::new("gen/schemas");
        if schemas.exists() {
            for entry in std::fs::read_dir(schemas).expect("generated schema directory") {
                let path = entry.expect("schema entry").path();
                if path.extension().and_then(|s| s.to_str()) != Some("json") {
                    continue;
                }
                let bytes = std::fs::read(&path).expect("read generated schema");
                let value: serde_json::Value = serde_json::from_slice(&bytes).expect("schema JSON");
                let compact = serde_json::to_vec(&value).expect("compact schema JSON");
                assert_eq!(
                    serde_json::from_slice::<serde_json::Value>(&compact).unwrap(),
                    value
                );
                std::fs::write(path, compact).expect("write compact schema JSON");
            }
        }
    }
}
