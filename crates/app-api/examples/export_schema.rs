fn main() {
    println!(
        "{}",
        app_api::openapi_document()
            .to_json()
            .expect("OpenAPI serialization")
    );
}
