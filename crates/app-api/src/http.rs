use crate::{Editor, VERSION};
use axum::{
    body::Body,
    extract::{DefaultBodyLimit, Path, Request, State},
    http::{header, StatusCode},
    middleware::{self, Next},
    response::{Html, IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use contracts::*;
use std::{
    collections::BTreeMap,
    sync::{Arc, Mutex},
};
use utoipa::OpenApi;

#[derive(Clone)]
pub struct ServerState {
    pub editor: Arc<Mutex<Editor>>,
    pub token: String,
    pub origin: String,
    pub assets: Arc<BTreeMap<&'static str, &'static [u8]>>,
}

struct ApiError(Fault);
impl From<Fault> for ApiError {
    fn from(error: Fault) -> Self {
        Self(error)
    }
}
impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status = match self.0.code.as_str() {
            "document.not_found" => StatusCode::NOT_FOUND,
            "document.revision_conflict" | "storage.external_change" => StatusCode::CONFLICT,
            "auth.denied" => StatusCode::FORBIDDEN,
            _ => StatusCode::UNPROCESSABLE_ENTITY,
        };
        (status, Json(self.0)).into_response()
    }
}
type ApiResult<T> = std::result::Result<T, ApiError>;

async fn run<T: Send + 'static>(
    state: ServerState,
    operation: impl FnOnce(&mut Editor) -> Result<T> + Send + 'static,
) -> ApiResult<Json<T>> {
    tokio::task::spawn_blocking(move || {
        let mut editor = state
            .editor
            .lock()
            .map_err(|_| Fault::new("internal.lock"))?;
        operation(&mut editor)
    })
    .await
    .map_err(|error| Fault::new("internal.task").detail(error))?
    .map(Json)
    .map_err(Into::into)
}

async fn authorize(State(state): State<ServerState>, request: Request, next: Next) -> Response {
    let headers = request.headers();
    let expected_host = state.origin.trim_start_matches("http://");
    let host_ok = headers.get(header::HOST).and_then(|v| v.to_str().ok()) == Some(expected_host);
    let origin_ok = headers
        .get(header::ORIGIN)
        .is_none_or(|v| v.to_str().ok() == Some(&state.origin));
    let token_ok =
        headers.get("x-war2-session").and_then(|v| v.to_str().ok()) == Some(&state.token);
    if !host_ok || !origin_ok || !token_ok {
        return ApiError(Fault::new("auth.denied")).into_response();
    }
    next.run(request).await
}

#[utoipa::path(get, path = "/api/v1/health", responses((status = 200, body = Health)))]
async fn health() -> Json<Health> {
    Json(Health {
        version: VERSION.into(),
        api: API_VERSION.into(),
    })
}

#[utoipa::path(get, path = "/api/v1/catalog", responses((status = 200, body = [CommandSpec])))]
async fn catalog(State(state): State<ServerState>) -> ApiResult<Json<Vec<CommandSpec>>> {
    run(state, |editor| Ok(editor.services.triggers.catalog())).await
}

#[utoipa::path(post, path = "/api/v1/documents/import", request_body = ImportRequest,
    responses((status = 200, body = DocumentView), (status = 422, body = Fault)))]
async fn import(
    State(state): State<ServerState>,
    Json(request): Json<ImportRequest>,
) -> ApiResult<Json<DocumentView>> {
    run(state, move |editor| {
        let file = editor
            .services
            .storage
            .import(&request.name, &request.bytes)?;
        editor.open(file)
    })
    .await
}

#[utoipa::path(post, path = "/api/v1/documents/open", responses((status = 200, body = DocumentView)))]
async fn open(State(state): State<ServerState>) -> ApiResult<Json<DocumentView>> {
    run(state, |editor| {
        let file = editor.services.storage.select_open()?;
        editor.open(file)
    })
    .await
}

async fn create(State(state): State<ServerState>) -> ApiResult<Json<DocumentView>> {
    run(state, |editor| {
        let mut bytes = editor.services.triggers.assemble(&[], 237)?;
        bytes.extend_from_slice(&[0, 253]);
        let file = editor.services.storage.import("untitled.w2tr", &bytes)?;
        editor.open(file)
    })
    .await
}

#[utoipa::path(get, path = "/api/v1/documents/{id}", params(("id" = String, Path)),
    responses((status = 200, body = DocumentView)))]
async fn document(
    State(state): State<ServerState>,
    Path(id): Path<String>,
) -> ApiResult<Json<DocumentView>> {
    run(state, move |editor| editor.view(&id)).await
}

#[utoipa::path(post, path = "/api/v1/documents/{id}/changes/preview", request_body = ChangeRequest,
    params(("id" = String, Path)), responses((status = 200, body = ChangePreview)))]
async fn preview(
    State(state): State<ServerState>,
    Path(id): Path<String>,
    Json(request): Json<ChangeRequest>,
) -> ApiResult<Json<ChangePreview>> {
    run(state, move |editor| editor.preview(&id, &request)).await
}

#[utoipa::path(post, path = "/api/v1/documents/{id}/changes/apply", request_body = ChangeRequest,
    params(("id" = String, Path)), responses((status = 200, body = DocumentView)))]
async fn apply(
    State(state): State<ServerState>,
    Path(id): Path<String>,
    Json(request): Json<ChangeRequest>,
) -> ApiResult<Json<DocumentView>> {
    run(state, move |editor| editor.apply(&id, request)).await
}

#[utoipa::path(post, path = "/api/v1/documents/{id}/command-preview", request_body = CommandEditRequest,
    params(("id" = String, Path)), responses((status = 200, body = ChangePreview)))]
async fn command_preview(
    State(state): State<ServerState>,
    Path(id): Path<String>,
    Json(request): Json<CommandEditRequest>,
) -> ApiResult<Json<ChangePreview>> {
    run(state, move |editor| editor.command_preview(&id, request)).await
}

#[utoipa::path(post, path = "/api/v1/commands/draft", request_body = CommandDraftRequest,
    responses((status = 200, body = Instruction)))]
async fn command_draft(
    State(state): State<ServerState>,
    Json(request): Json<CommandDraftRequest>,
) -> ApiResult<Json<Instruction>> {
    run(state, move |editor| {
        editor.services.triggers.draft(&request)
    })
    .await
}

#[utoipa::path(post, path = "/api/v1/documents/{id}/rules/preview", request_body = RuleRequest,
    params(("id" = String, Path)), responses((status = 200, body = ChangePreview)))]
async fn rule_preview(
    State(state): State<ServerState>,
    Path(id): Path<String>,
    Json(request): Json<RuleRequest>,
) -> ApiResult<Json<ChangePreview>> {
    run(state, move |editor| editor.rule_preview(&id, request)).await
}

#[utoipa::path(post, path = "/api/v1/documents/{id}/blocks/preview", request_body = BlockRequest,
    params(("id" = String, Path)), responses((status = 200, body = ChangePreview)))]
async fn block_preview(
    State(state): State<ServerState>,
    Path(id): Path<String>,
    Json(request): Json<BlockRequest>,
) -> ApiResult<Json<ChangePreview>> {
    run(state, move |editor| {
        editor.block_preview(
            &id,
            request.expected_revision,
            request.start,
            &request.action,
        )
    })
    .await
}

#[utoipa::path(post, path = "/api/v1/documents/{id}/save", request_body = SaveRequest,
    params(("id" = String, Path)), responses((status = 200, body = SaveReceipt)))]
async fn save(
    State(state): State<ServerState>,
    Path(id): Path<String>,
    Json(request): Json<SaveRequest>,
) -> ApiResult<Json<SaveReceipt>> {
    run(state, move |editor| editor.save(&id, request)).await
}

async fn undo(
    State(state): State<ServerState>,
    Path(id): Path<String>,
    Json(request): Json<RevisionRequest>,
) -> ApiResult<Json<DocumentView>> {
    run(state, move |editor| {
        editor.history(&id, request.expected_revision, false)
    })
    .await
}
async fn redo(
    State(state): State<ServerState>,
    Path(id): Path<String>,
    Json(request): Json<RevisionRequest>,
) -> ApiResult<Json<DocumentView>> {
    run(state, move |editor| {
        editor.history(&id, request.expected_revision, true)
    })
    .await
}
async fn export(State(state): State<ServerState>, Path(id): Path<String>) -> ApiResult<Response> {
    let Json(bytes) = run(state, move |editor| editor.export(&id)).await?;
    Ok(([(header::CONTENT_TYPE, "application/octet-stream")], bytes).into_response())
}

#[utoipa::path(get, path = "/api/v1/recoveries", responses((status = 200, body = [RecoveryEntry])))]
async fn recoveries(State(state): State<ServerState>) -> ApiResult<Json<Vec<RecoveryEntry>>> {
    run(state, |editor| editor.services.storage.recoveries()).await
}

async fn recover(
    State(state): State<ServerState>,
    Path(id): Path<String>,
) -> ApiResult<Json<DocumentView>> {
    run(state, move |editor| editor.recover(&id)).await
}

#[derive(OpenApi)]
#[openapi(
    paths(
        health,
        catalog,
        import,
        open,
        document,
        preview,
        apply,
        save,
        command_preview,
        command_draft,
        rule_preview,
        block_preview,
        recoveries,
        backups,
        restore
    ),
    components(schemas(
        Health,
        CommandSpec,
        DocumentView,
        SectionView,
        Program,
        Instruction,
        RecoveryEntry,
        BackupEntry,
        RestoreRequest,
        RestoreResult,
        NumericField,
        FieldOption,
        CommandEditRequest,
        Fault,
        ImportRequest,
        ChangeRequest,
        ChangePreview,
        RevisionRequest,
        SaveRequest,
        SaveReceipt,
        CommandDraftRequest,
        RuleCondition,
        RuleRequest,
        ScenarioBlock,
        CompiledRule,
        BlockRequest
    ))
)]
struct Definition;

#[utoipa::path(get, path = "/api/v1/documents/{id}/backups", params(("id" = String, Path)),
    responses((status = 200, body = [BackupEntry])))]
async fn backups(
    State(state): State<ServerState>,
    Path(id): Path<String>,
) -> ApiResult<Json<Vec<BackupEntry>>> {
    run(state, move |editor| editor.backups(&id)).await
}

#[utoipa::path(post, path = "/api/v1/documents/{id}/restore", params(("id" = String, Path)),
    request_body = RestoreRequest, responses((status = 200, body = RestoreResult)))]
async fn restore(
    State(state): State<ServerState>,
    Path(id): Path<String>,
    Json(request): Json<RestoreRequest>,
) -> ApiResult<Json<RestoreResult>> {
    run(state, move |editor| editor.restore(&id, request)).await
}

pub fn openapi_document() -> utoipa::openapi::OpenApi {
    Definition::openapi()
}

async fn schema() -> Json<utoipa::openapi::OpenApi> {
    Json(Definition::openapi())
}

async fn index(State(state): State<ServerState>, request: Request) -> Response {
    if request
        .headers()
        .get(header::HOST)
        .and_then(|v| v.to_str().ok())
        != Some(state.origin.trim_start_matches("http://"))
    {
        return StatusCode::FORBIDDEN.into_response();
    }
    match state
        .assets
        .get("index.html")
        .and_then(|bytes| std::str::from_utf8(bytes).ok())
    {
        Some(text) => {
            let mut response = Html(text.replace("__WAR2_SESSION__", &state.token)).into_response();
            response
                .headers_mut()
                .insert(header::CACHE_CONTROL, "no-store".parse().unwrap());
            response.headers_mut().insert(header::CONTENT_SECURITY_POLICY,
                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'".parse().unwrap());
            response
        }
        None => StatusCode::SERVICE_UNAVAILABLE.into_response(),
    }
}

async fn asset(State(state): State<ServerState>, Path(path): Path<String>) -> Response {
    if path
        .split('/')
        .any(|p| p == ".." || p.contains('\\') || p.contains(':'))
    {
        return StatusCode::BAD_REQUEST.into_response();
    }
    let content_type = if path.ends_with(".js") {
        "text/javascript"
    } else if path.ends_with(".css") {
        "text/css"
    } else {
        return StatusCode::NOT_FOUND.into_response();
    };
    match state.assets.get(format!("assets/{path}").as_str()) {
        Some(bytes) => ([(header::CONTENT_TYPE, content_type)], Body::from(*bytes)).into_response(),
        None => StatusCode::NOT_FOUND.into_response(),
    }
}

pub fn router(state: ServerState) -> Router {
    let api = Router::new()
        .route("/health", get(health))
        .route("/catalog", get(catalog))
        .route("/commands/draft", post(command_draft))
        .route("/openapi.json", get(schema))
        .route("/recoveries", get(recoveries))
        .route("/recoveries/{id}/open", post(recover))
        .route("/documents/import", post(import))
        .route("/documents/open", post(open))
        .route("/documents/create", post(create))
        .route("/documents/{id}", get(document))
        .route("/documents/{id}/changes/preview", post(preview))
        .route("/documents/{id}/changes/apply", post(apply))
        .route("/documents/{id}/command-preview", post(command_preview))
        .route("/documents/{id}/rules/preview", post(rule_preview))
        .route("/documents/{id}/blocks/preview", post(block_preview))
        .route("/documents/{id}/save", post(save))
        .route("/documents/{id}/backups", get(backups))
        .route("/documents/{id}/restore", post(restore))
        .route("/documents/{id}/undo", post(undo))
        .route("/documents/{id}/redo", post(redo))
        .route("/documents/{id}/export", get(export))
        .layer(middleware::from_fn_with_state(state.clone(), authorize));
    Router::new()
        .nest("/api/v1", api)
        .route("/", get(index))
        .route("/assets/{*path}", get(asset))
        .layer(DefaultBodyLimit::max(4 * 1024 * 1024))
        .with_state(state)
}
