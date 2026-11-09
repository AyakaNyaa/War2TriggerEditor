var LSZ
{
LSZ=5
if argument0=0
lb=ds_list_create()
else
ds_list_clear(lb)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(lb,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}