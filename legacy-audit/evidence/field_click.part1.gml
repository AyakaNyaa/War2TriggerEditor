if drawer2.AC=1
{
if !instance_exists(smsmenu_main)
{
if T=0
{
if global.ret[b]=1
global.ret[b]=0
else
global.ret[b]=1
}
if T=1
{
v=0
for (i=b+bb-1; i>=b; i-=1)
{
v*=256
v+=global.ret[i]
}
var vs,vo
{
vo=v
if v>=0
vs=string(v)
else
vs=''
v=wd_input_box(tu,string(mn)+'-'+string(mx),vs)
if v=''
v=vo
else
v=real(string_digits(v))
}
/*
if v>=0
v=real(string_digits(get_string(tu,string(v))))
else
v=real(string_digits(get_string(tu,'')))
*/
if v<=mx and v>=mn
{
for (i=0; i<bb; i+=1)
{
global.ret[b+i]=v mod 256
v=v div 256
}
}
else
{
tr=1
image_speed=1
}
}
if keyboard_check_pressed(vk_enter) and T>=2 and T<=17
{
global.menuX=x+100
global.menuY=y+23
}
if T=2
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_p15)
}
if T=3
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_u)
}
if T=4
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_g)
}
if T=5
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_s)
}
if T=6
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_r)
}
if T=7
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_j)
}
if T=8
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_m)
}
if T=9
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_d)
}
if T=10
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_b)
}
if T=11
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_p7)
}
if T=12
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_p8)
}
if T=13
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_u2)
}
if T=14
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_u3)
}
if T=15
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_j2)
}
if T=16
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_ru)
}
if T=17
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_lu)
}
if T=18
{
var fn_,f_,crs_;
{
crs_=0
fn_=''
fn_=get_open_filename('*.pud','*.pud')
if fn_!=''
{
f_=file_bin_open(fn_,2)
file_bin_seek(f_,20)
crs_+=file_bin_read_byte(f_)
crs_+=256*file_bin_read_byte(f_)
crs_+=256*256*file_bin_read_byte(f_)
crs_+=256*256*256*file_bin_read_byte(f_)
file_bin_close(f_)
if (crs_<0 or crs_>256*256*256*256)
crs_=0
v=crs_
for (i=0; i<bb; i+=1)
{
global.ret[b+i]=v mod 256
v=v div 256
}
}
else
{
for (i=0; i<bb; i+=1)
{
global.ret[b+i]=-1
}
}
}
}
if T=19
{
if global.AN=1
{
for (i=b; i<100; i+=1)
{
global.ret[i]=-1
}
var tx;
{
//tx=get_string('','')
tx=wd_input_box('Text','','')
tx=string_replace_all(tx,"\x3",chr(3))
tx=string_replace_all(tx,"\x4",chr(4))
tx=string_replace_all(tx,"\x5",chr(5))
tx=string_replace_all(tx,"\x6",chr(6))
tx=string_replace_all(tx,"\x13",chr(13))
if string_length(tx)>0 and string_length(tx)<=59
{
global.ret[b]=string_length(tx)
for (i=1; i<string_length(tx)+1; i+=1)
{
global.ret[b+i]=ord(string_char_at(tx,i))
}
}
else
{
tr=1
image_speed=1
}
}
}
}
if T=20
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_at)
}
if T=21
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_atu)
}
if T=22
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_atp)
}
if T=23
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_ats)
}
if T=24
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_g2)
}
if T=25
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_mt)
}
if T=26
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_or)
}
if T=27
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_pr)
}
if T=28
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_tt)
}
if T=29
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_pr2)
}
if T=30
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_g3)
}
if T=31
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_bl)
}
if T=32
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_g)
}
if T=33
{
global.menu=''
global.menur=id
instance_create(0,0,smsmenu_cont)
}
if T=34//mission obj
{
if global.AN=1
{
for (i=b; i<1024; i+=1)
{
global.ret[i]=-1
}
var tx;
{
//tx=get_string('','')
tx=wd_input_box('Mission obj','','')+chr(0)
tx=string_replace_all(tx,"\n",chr(10))
tx=string_replace_all(tx,"\x3",chr(3))
tx=string_replace_all(tx,"\x4",chr(4))
tx=string_replace_all(tx,"\x5",chr(5))
tx=string_replace_all(tx,"\x6",chr(6))
tx=string_replace_all(tx,"\x13",chr(13))
if string_length(tx)>0 and string_length(tx)<=511
{
global.ret[b]=string_length(tx) mod 256
global.ret[b+1]=string_length(tx) div 256
for (i=2; i<string_length(tx)+2; i+=1)
{
global.ret[b+i]=ord(string_char_at(tx,i-1))
}
}
else
{
tr=1
image_speed=1
}
}
}
}
if T=35//unit name
{
if global.AN=1
{
for (i=b; i<1024; i+=1)
{
global.ret[i]=-1
}
var tx;
{
//tx=get_string('','')
tx=wd_input_box('Name','','')+chr(0)
tx=string_replace_all(tx,"\x3",chr(3))
tx=string_replace_all(tx,"\x4",chr(4))
tx=string_replace_all(tx,"\x5",chr(5))
tx=string_replace_all(tx,"\x6",chr(6))
tx=string_replace_all(tx,"\x13",chr(13))
if string_length(tx)>0 and string_length(tx)<=47
{
global.ret[b]=string_length(tx) mod 256
global.ret[b+1]=string_length(tx) div 256
for (i=2; i<string_length(tx)+2; i+=1)
{
global.ret[b+i]=ord(string_char_at(tx,i-1))
}
}
else
{
tr=1
image_speed=1
}
}
}
}


}
}