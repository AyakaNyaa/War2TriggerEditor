INIT_LISTS()
instance_create(32,160,logo)
instance_create(0,0,buttonc)
instance_create(32,-52,buttona)
instance_create(280,-58,buttonnv)
instance_create(500,-58,buttonnf)
com=ds_list_create()
for (i=0; i<16500; i+=1)
{
HG[i]=0
HT[i]=''
}
MHG=0
remap=1
fn=''
f=0
global.t=''
myy=0
yy=0
xx=0
xxo=0
eif=0
erp=0
t=''
m=0
mx=0
my=0
b=0
sb=0
a=0
af=0
A=0
r=0
ne=0
psb=0
psel=0
nsel=0
nselb=0
sel=-1
selp=ds_list_create()
delsel=-1
vds=1
lstk=0
mr=''
prs=0
sbtn=0
sbtnn=0

BA=0
BU=0
BD=0
BC=0
BM=0
BR=0
BS=0
BL=0
BS1=0
BL1=0
BG=0

skp=0

tr_max=0


DS=ds_list_create()
ds_list_add(DS,60)
ds_list_add(DS,87)
ds_list_add(DS,93)
ds_list_add(DS,94)
ds_list_add(DS,97)
ds_list_add(DS,100)
ds_list_add(DS,104)
ds_list_add(DS,105)
ds_list_add(DS,106)
ds_list_add(DS,122)
ds_list_add(DS,123)

OM=ds_list_create()
ds_list_add(OM,2)
ds_list_add(OM,56)
ds_list_add(OM,60)
ds_list_add(OM,64)
ds_list_add(OM,74)
ds_list_add(OM,80)
ds_list_add(OM,87)
ds_list_add(OM,100)
ds_list_add(OM,104)
ds_list_add(OM,105)
ds_list_add(OM,106)

ALC=ds_list_create()
ds_list_add(ALC,1)
ds_list_add(ALC,2)
ds_list_add(ALC,24)
ds_list_add(ALC,25)
ds_list_add(ALC,27)
ds_list_add(ALC,28)
ds_list_add(ALC,57)
ds_list_add(ALC,58)
ds_list_add(ALC,29)
ds_list_add(ALC,32)
ds_list_add(ALC,36)
ds_list_add(ALC,37)
ds_list_add(ALC,65)
ds_list_add(ALC,66)
ds_list_add(ALC,67)
ds_list_add(ALC,68)
ds_list_add(ALC,75)
ds_list_add(ALC,76)
ds_list_add(ALC,120)
ds_list_add(ALC,121)


view_xview[0]=-110
if lstk>0
lstk-=1
if prs>0
prs-=1



if (keyboard_check_released(ord("D")) and keyboard_check(vk_control)) or BC
{
if (sel!=ds_list_size(com)-2)
{
for (i=ds_list_size(selp)-1; i>=0; i-=1)
{
ds_list_insert(com,sel,ds_list_find_value(selp,i))
}
}
remap=1
}

if global.AUTS=0
{
my = window_get_y()+window_mouse_get_y()
if my<window_get_y()
view_yview[0]-=window_get_y()-my
if my>window_get_y()+window_get_height()
view_yview[0]+=my-(window_get_y()+window_get_height())
}

if keyboard_check_released(vk_pageup)
{
//view_yview[0]-=810
sbtn=3
sbtnn=9
}
if keyboard_check_released(vk_pagedown)
{
//view_yview[0]+=810
sbtn=4
sbtnn=9
}

if mouse_wheel_up()
view_yview[0]-=64
if mouse_wheel_down()
view_yview[0]+=64
if keyboard_check(vk_space)
view_yview[0]=0
if view_yview[0]<-64
view_yview[0]=-64
if view_yview[0]>myy
view_yview[0]=myy

if keyboard_check_released(vk_home)
{
view_yview[0]=0
sbtn=1
}
if keyboard_check_released(vk_end)
{
view_yview[0]=MHG
sbtn=2
}

/*
if (ne=1)
{
if (ds_list_size(com)<2) or (!(ds_list_find_value(com,ds_list_size(com)-2)=254 and ds_list_find_value(com,ds_list_size(com)-1)=255))
{
ds_list_add(com,254)
ds_list_add(com,255)
}
}


var AMR
{
AMR=-1
if mr!=''
{
AMR=ds_list_find_index(ltn,mr)
mr=''
global.ret[0]=AMR
creator()
if instance_number(field)!=0
{
BA=1
with all
{
if object_index=field or object_index=checkbox
instance_destroy()
}
}
else
{
global.AN=1
global.AR=1
remap=1
}
}
if keyboard_check_released(vk_space) or keyboard_check_released(vk_insert) or BA
{
{
for (i=0; i<1024; i+=1)
{
global.ret[i]=-1
}
global.ret[0]=AMR
global.AN=1
room_goto(room_ad)
}
}
add_ret()
}


ds_list_clear(global.COMS)
ds_list_copy(global.COMS,com)
if keyboard_check_released(ord('S')) or BS or BS1
{
if ds_list_size(com)!=0
{
if ds_list_size(com)<=16000
{
if keyboard_check(vk_control) or BS1
save_tr()
else
save()
global.NOTSAVE=0
}
else
show_message("ERROR! Too many triggers!")
}
else
{
ds_list_add(com,0)
ds_list_add(com,0)
ds_list_add(com,0)
ds_list_add(com,0)
if keyboard_check(vk_control) or BS1
save_tr()
else
save()
ds_list_clear(com)
}
}


if keyboard_check_released(ord('L')) or BL or BL1
{
ne=1
if keyboard_check(vk_control) or BL1
load_tr()
else
load()
if ds_list_size(com)=0
ne=0
sel=-1
if ds_list_find_value(com,0)=0
{
ne=0
ds_list_clear(com)
}
remap=1
}


if keyboard_check(vk_delete)
BR=1
if BR
{
if sel!=-1
{
wd_message_set_text(lstr(134))
if wd_message_show_pos(wd_mk_confirmation,wd_mb_yes,wd_mb_none,wd_mb_no,window_get_x()+320,window_get_y()+280)=wd_mb_yes
{
if ds_list_find_value(com,sel)=254 and ds_list_find_value(com,sel+1)=237
{
wd_message_set_text(lstr(135))
if wd_message_show_pos(wd_mk_confirmation,wd_mb_yes,wd_mb_none,wd_mb_no,window_get_x()+320,window_get_y()+280)=wd_mb_yes
{
ne=0
ds_list_clear(com)
view_yview[0]=0
sel=-1
}
}
else
{
b=nsel-sel
while b!=0
{
ds_list_delete(com,sel+(b-1))
b-=1
}
}
ds_list_clear(selp)
delsel=sel
sel=-1
remap=1
}
}
}


if keyboard_check(vk_control) and keyboard_check_pressed(ord('C'))
{
if sel>-1 and sel<ds_list_size(com)-2
{
if ds_list_size(selp)!=0
{
var BUF
{
BUF='TR%'
BUF+=ds_list_write(selp)
clipboard_set_text(BUF)
}
}
}
}
if keyboard_check(vk_control) and keyboard_check_pressed(ord('V'))
{
if clipboard_has_text()
{
var BUF,BUFL,BPOS
{
BUF=clipboard_get_text()
if string_copy(BUF,0,3)='TR%'
{
BUF=string_copy(BUF,4,string_length(BUF)-3)
BUFL=ds_list_create()
ds_list_read(BUFL,BUF)
if sel!=-1
BPOS=sel
else
{
if ds_list_size(com)>2
BPOS=ds_list_size(com)-2
else
BPOS=0
ne=1
}
for (i=0; i<ds_list_size(BUFL); i+=1)
{
ds_list_insert(com,BPOS+i,ds_list_find_value(BUFL,i))
}
remap=1
}
}
}
}
if keyboard_check(vk_control) and keyboard_check_pressed(ord('X'))
{
var Cps,Cpe,Cpl,BUF;
{
Cps=real(string_digits(get_string('start','')))
Cpe=real(string_digits(get_string('end','')))
Cpl=ds_list_create()
for (i=Cps; i<Cpe; i+=1)
{
ds_list_add(Cpl,ds_list_find_value(com,i))    
}
BUF='TR%'
BUF+=ds_list_write(Cpl)
clipboard_set_text(BUF)
}
}
if keyboard_check(vk_control) and keyboard_check_pressed(ord('Z'))
{
skp=real(string_digits(get_string('skip','')))
for (i=0; i<ds_list_size(com); i+=1)
{
if (i>=skp)
{
skp=i
break
}
var MXS
{
MXS=1024
//if ds_list_find_value(com,i)=37
//MXS=64
for (j=0; j<min(MXS,ds_list_size(com)); j+=1)
{
global.a[j]=ds_list_find_value(com,i+j)
}
}
trig()
}
remap=1
}


if (ne=1)
{
if (ds_list_size(com)<2) or (!(ds_list_find_value(com,ds_list_size(com)-2)=254 and ds_list_find_value(com,ds_list_size(com)-1)=237))
{
ds_list_add(com,254)
ds_list_add(com,237)
}
}

if remap=1
{
global.NOTSAVE=1
remap=0
//for (i=0; i<16500; i+=1)
//{
//HG[i]=0
//HT[i]=''
//}
yy=0
tr_max=0
for (i=skp; i<ds_list_size(com); i+=1)
{
tr_max+=1
HG[i]=yy
t=''
var MXS
{
MXS=1024
//if ds_list_find_value(com,i)=37
//MXS=64
for (j=0; j<min(MXS,ds_list_size(com)); j+=1)
{
global.a[j]=ds_list_find_value(com,i+j)
}
}
trig()

if t!=''
{
if ds_list_find_index(DS,global.a[0])!=-1
t+='#%color[449900]'+lstr(196)
if ds_list_find_index(OM,global.a[0])!=-1
t+='#%color[990000]'+lstr(185)