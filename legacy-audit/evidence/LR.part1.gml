var LSZ
{
LSZ=60
if argument0=0
lr=ds_list_create()
else
ds_list_clear(lr)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(lr,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}