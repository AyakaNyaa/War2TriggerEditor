var LSZ
{
LSZ=61
if argument0=0
lor=ds_list_create()
else
ds_list_clear(lor)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(lor,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}