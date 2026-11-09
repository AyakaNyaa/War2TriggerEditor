var LSZ
{
LSZ=7
if argument0=0
ld=ds_list_create()
else
ds_list_clear(ld)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(ld,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}