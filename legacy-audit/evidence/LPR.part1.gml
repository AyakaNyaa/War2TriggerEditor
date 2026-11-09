var LSZ
{
LSZ=3
if argument0=0
lpr=ds_list_create()
else
ds_list_clear(lpr)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(lpr,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}