global.VERSION='1.6.1'
global.LANG_SIZE=1006-1
global.NOTSAVE=0
global.COMS=ds_list_create()
global.COLB=0
global.AUTS=0
global.LAST_LANG='w2tedit eng.lang'
global.LANGT='lang'
if file_exists('w2tedit')
{
var FE
{
FE=file_text_open_read('w2tedit')
file_text_readln(FE)
global.COLB=file_text_read_real(FE)
file_text_readln(FE)
global.AUTS=file_text_read_real(FE)
file_text_readln(FE)
global.LAST_LANG=file_text_read_string(FE)
file_text_close(FE)
}
}
global.TLANG=ds_list_create()
global.LANG=ds_list_create()
nl=0
if global.LAST_LANG=''
nl=1
if global.LAST_LANG!=''
{
if !file_exists(global.LAST_LANG)
nl=1
}
ll=global.LAST_LANG
if nl=1
{
ll='w2tedit eng.lang'
if !file_exists(ll)
export_include_file_location('w2tedit.txt',ll)
}
if file_exists(ll)
{
global.LAST_LANG=ll
F=file_text_open_read(ll)
global.LANGT=file_text_read_string(F)
file_text_readln(F)
while !file_text_eof(F)
{
ds_list_add(global.LANG,file_text_read_string(F))
file_text_readln(F)
}
file_text_close(F)
}
global.SZ=0

for (i=0; i<1024; i+=1)
{
global.a[i]=0
}
for (i=0; i<1024; i+=1)
{
global.ret[i]=-1
}
global.AN=0
global.menu=''
global.menur=0
global.AR=0
global.AP=0
global.menuX=-1
global.menuY=-1
global.SE=0