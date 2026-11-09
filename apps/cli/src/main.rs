use serde_json::{json, Value};
use std::{env, fs, path::Path};

fn run() -> Result<i32, Box<dyn std::error::Error>> {
    let arguments: Vec<_> = env::args().skip(1).collect();
    if arguments.len() != 3 {
        println!("{}", include_str!("../HELP.txt"));
        return Ok(1);
    }
    let session: Value = serde_json::from_slice(&fs::read(&arguments[0])?)?;
    let url = session["url"].as_str().ok_or("session.url")?;
    let token = session["token"].as_str().ok_or("session.token")?;
    if !(url.starts_with("http://127.0.0.1:") && url[17..].chars().all(|c| c.is_ascii_digit())) {
        return Err("session.invalid_url".into());
    }
    let client = reqwest::blocking::Client::builder().no_proxy().build()?;
    let bytes = fs::read(&arguments[2])?;
    let name = Path::new(&arguments[2])
        .file_name()
        .ok_or("file.invalid_name")?
        .to_string_lossy();
    let response = client
        .post(format!("{url}/api/v1/documents/import"))
        .header("X-War2-Session", token)
        .json(&json!({"name": name, "bytes": bytes}))
        .send()?;
    if !response.status().is_success() {
        println!("{}", response.text()?);
        return Ok(1);
    }
    let document: Value = response.json()?;
    match arguments[1].as_str() {
        "inspect" => println!("{}", document),
        "validate" => {
            println!(
                "{}",
                json!({"program": document["program"]["diagnostics"], "container": document["diagnostics"]})
            );
            if document["writable"] != true {
                return Ok(2);
            }
        }
        "roundtrip" => {
            let id = document["id"].as_str().ok_or("document.invalid_response")?;
            let exported = client
                .get(format!("{url}/api/v1/documents/{id}/export"))
                .header("X-War2-Session", token)
                .send()?
                .error_for_status()?
                .bytes()?;
            let identical = exported.as_ref() == bytes;
            println!("{}", json!({"identical": identical, "bytes": bytes.len()}));
            if !identical {
                return Ok(2);
            }
        }
        _ => return Err("cli.invalid_command".into()),
    }
    Ok(0)
}

fn main() {
    let status = match run() {
        Ok(status) => status,
        Err(error) => {
            eprintln!("{}", json!({"error": error.to_string()}));
            1
        }
    };
    std::process::exit(status);
}
