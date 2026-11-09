var LSZ
{
LSZ=6
if argument0=0
lj=ds_list_create()
else
ds_list_clear(lj)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(lj,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}