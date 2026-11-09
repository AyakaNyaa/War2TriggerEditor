var LSZ
{
LSZ=28
if argument0=0
ltu=ds_list_create()
else
ds_list_clear(ltu)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(ltu,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}