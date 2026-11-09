var LSZ
{
LSZ=3
if argument0=0
lcont=ds_list_create()
else
ds_list_clear(lcont)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(lcont,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}