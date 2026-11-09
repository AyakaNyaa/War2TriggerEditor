var_mmsize = 2
mmi[00] = lstr(150)
sms[00] = 3
for (i=0; i<3; i+=1)
{
smi[00,i] = ds_list_find_value(drawer2.lj,i)
}
mmi[01] = lstr(151)
sms[01] = 3
for (i=0; i<3; i+=1)
{
smi[01,i] = ds_list_find_value(drawer2.lj,i+3)
}