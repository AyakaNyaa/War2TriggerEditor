var LSZ
{
LSZ=141
if argument0=0
ltn=ds_list_create()
else
ds_list_clear(ltn)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(ltn,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}