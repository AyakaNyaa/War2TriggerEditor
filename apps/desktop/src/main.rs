#![cfg_attr(
    all(not(debug_assertions), feature = "gui"),
    windows_subsystem = "windows"
)]
use app_api::{router, Editor, ServerState, Services};
use std::{
    collections::BTreeMap,
    sync::{Arc, Mutex},
};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt().with_target(false).init();
    let runtime = tokio::runtime::Runtime::new()?;
    let port: u16 = std::env::var("WAR2_PORT")
        .unwrap_or_else(|_| "0".into())
        .parse()?;
    let listener = runtime.block_on(tokio::net::TcpListener::bind(("127.0.0.1", port)))?;
    let origin = format!("http://{}", listener.local_addr()?);
    let token = uuid::Uuid::new_v4().simple().to_string();
    let assets: BTreeMap<&str, &[u8]> = BTreeMap::from([
        (
            "index.html",
            include_bytes!("../../frontend/dist/index.html").as_slice(),
        ),
        (
            "assets/app.js",
            include_bytes!("../../frontend/dist/assets/app.js").as_slice(),
        ),
        (
            "assets/style.css",
            include_bytes!("../../frontend/dist/assets/style.css").as_slice(),
        ),
    ]);
    let services = Services {
        pud: Arc::new(format_pud::PudCodec),
        w2tr: Arc::new(format_w2tr::W2trCodec),
        triggers: Arc::new(trigger_engine::TriggerEngine::default()),
        storage: Arc::new(storage::LocalStorage::new(
            std::env::var_os("WAR2_RECOVERY_DIR")
                .map(std::path::PathBuf::from)
                .unwrap_or_else(|| {
                    std::env::var_os("LOCALAPPDATA")
                        .map(std::path::PathBuf::from)
                        .unwrap_or_else(std::env::temp_dir)
                        .join("War2TriggerEditor/recovery")
                }),
        )),
    };
    let state = ServerState {
        editor: Arc::new(Mutex::new(Editor::new(services))),
        token: token.clone(),
        origin: origin.clone(),
        assets: Arc::new(assets),
    };
    if let Ok(path) = std::env::var("WAR2_SESSION_FILE") {
        // Explicit automation bootstrap. Never logged or committed.
        std::fs::write(
            path,
            serde_json::to_vec(&serde_json::json!({"url": origin, "token": token}))?,
        )?;
    }
    let (shutdown, receive) = tokio::sync::oneshot::channel::<()>();
    let server = runtime.spawn(async move {
        axum::serve(listener, router(state))
            .with_graceful_shutdown(async {
                let _ = receive.await;
            })
            .await
    });
    let headless = std::env::args().any(|arg| arg == "--headless");
    #[cfg(feature = "gui")]
    if !headless {
        tauri::Builder::default()
            .setup(move |app| {
                tauri::WebviewWindowBuilder::new(
                    app,
                    "editor",
                    tauri::WebviewUrl::External(origin.parse()?),
                )
                .title("War2 Trigger Editor")
                .inner_size(1440.0, 900.0)
                .min_inner_size(900.0, 600.0)
                .build()?;
                Ok(())
            })
            .run(tauri::generate_context!())?;
        let _ = shutdown.send(());
        runtime.block_on(server)??;
        return Ok(());
    }
    let _ = headless;
    println!("War2 Trigger Editor: {origin}");
    runtime.block_on(tokio::signal::ctrl_c())?;
    let _ = shutdown.send(());
    runtime.block_on(server)??;
    Ok(())
}
