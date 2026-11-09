var LSZ
{
LSZ=3
if argument0=0
ltt=ds_list_create()
else
ds_list_clear(ltt)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(ltt,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}