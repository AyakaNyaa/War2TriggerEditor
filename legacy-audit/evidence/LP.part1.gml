var LSZ
{
LSZ=17
if argument0=0
lp=ds_list_create()
else
ds_list_clear(lp)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(lp,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}