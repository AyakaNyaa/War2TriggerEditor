var LSZ
{
LSZ=29
if argument0=0
lbl=ds_list_create()
else
ds_list_clear(lbl)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(lbl,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}