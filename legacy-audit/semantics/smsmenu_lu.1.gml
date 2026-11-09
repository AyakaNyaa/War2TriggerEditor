var_mmsize = 2
mmi[00] = lstr(184)+'1'
sms[00] = 20
for (i=0; i<20; i+=1)
{
smi[00,i] = ds_list_find_value(drawer2.ltu,i)
}
mmi[01] = lstr(184)+'2'
sms[01] = 8
for (i=0; i<8; i+=1)
{
smi[01,i] = ds_list_find_value(drawer2.ltu,20+i)
}