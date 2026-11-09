var LSZ
{
LSZ=4
if argument0=0
lmt=ds_list_create()
else
ds_list_clear(lmt)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(lmt,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}