if global.AR=1
{
global.AR=0
if global.AN=1
{
if ds_list_size(com)<16000
{
if ds_list_size(com)!=0
{
ds_list_delete(com,ds_list_size(com)-1)
ds_list_delete(com,ds_list_size(com)-1)
}
var Ii
{
Ii=0
for (i=0; i<1024; i+=1)
{
if global.ret[i]!=-1
{
if ds_list_find_index(DS,global.ret[0])!=-1
ds_list_insert(com,i,global.ret[i])
else
{
delsel=sel
if sel=-1
ds_list_add(com,global.ret[i])
else
ds_list_insert(com,sel+i,global.ret[i])
}
Ii=i+1
}
else
i=2000
}
if global.ret[0]=22 or global.ret[0]=33
{
if sel=-1
ds_list_add(com,23)
else
ds_list_insert(com,sel+Ii,23)
}
if global.ret[0]=125
{
if sel=-1
ds_list_add(com,126)
else
ds_list_insert(com,sel+Ii,126)
}
}
for (i=0; i<1024; i+=1)
{
global.ret[i]=-1
}
ne=1
}
}
else
{
for (i=global.AP; i<global.AP+ds_list_size(selp); i+=1)
{
ds_list_delete(com,global.AP)
}
for (i=0; i<1024; i+=1)
{
if global.ret[i]!=-1
{
delsel=global.AP
//ds_list_replace(com,global.AP+i,global.ret[i])
ds_list_insert(com,global.AP+i,global.ret[i])
}
else
i=2000
}
for (i=0; i<1024; i+=1)
{
global.ret[i]=-1
}
}
remap=1
}