import type { BackupEntry, RecoveryEntry } from '../shared/generated';
import type { Translate } from '../shared/presentation';

type Props = { help: boolean; setHelp: (value: boolean) => void; t: Translate; locale: string; busy: boolean;
  recoveries?: RecoveryEntry[]; closeRecovery: () => void; backups?: BackupEntry[]; closeBackups: () => void;
  onRecover: (id: string) => void; onRestore: (id: string) => void };

export function FileDialogs(props: Props) {
  const { t } = props;
  if (props.help) return <div className="overlay"><section role="dialog" aria-modal="true" aria-labelledby="help-title" className="dialog"><h2 id="help-title">{t('help')}</h2><p>{t('builder.help')}</p><button className="gold" autoFocus onClick={() => props.setHelp(false)}>{t('close')}</button></section></div>;
  if (props.recoveries) return <div className="overlay"><section role="dialog" aria-modal="true" aria-labelledby="recovery-title" className="dialog"><h2 id="recovery-title">{t('recoveries')}</h2>
    {!props.recoveries.length && <p className="muted">{t('recovery.empty')}</p>}
    {props.recoveries.map((entry) => <div className="recovery-entry" key={entry.id}><span>{entry.name} · {t('revision')} {entry.revision}</span><button disabled={props.busy} onClick={() => props.onRecover(entry.id)}>{t('recover')}</button></div>)}
    <button autoFocus onClick={props.closeRecovery}>{t('close')}</button></section></div>;
  if (props.backups) return <div className="overlay"><section role="dialog" aria-modal="true" aria-labelledby="backup-title" className="dialog"><h2 id="backup-title">{t('backups')}</h2>
    {!props.backups.length && <p>{t('backups.empty')}</p>}
    {props.backups.map((entry) => <div className="recovery-entry" key={entry.id}><span>{new Date(entry.created_unix * 1000).toLocaleString(props.locale)} · {entry.size.toLocaleString()} {t('bytes')}</span><button disabled={props.busy} onClick={() => props.onRestore(entry.id)}>{t('recover')}</button></div>)}
    <button autoFocus onClick={props.closeBackups}>{t('close')}</button></section></div>;
  return null;
}
