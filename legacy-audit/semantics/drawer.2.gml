if ds_list_find_index(ALC,global.a[0])!=-1
t+='#%color[002233]'+lstr(195)
if string_width(t)>800-40-xx
draw_set_font(font0)
t=break_text(t,800-40-xx)
HT[i]=t
}
yy+=string_height(t)+16
}
myy=yy-100
if myy<0
myy=0
MHG=myy
}


draw_background(background0,view_xview[0],view_yview[0])
draw_set_font(font0)
draw_set_color(c_black)
draw_text(32,-24,"Triggers size: "+string(ds_list_size(com))+' bytes')
m=0
mx=mouse_x
my=mouse_y
if !instance_exists(smsmenu_main)
{
if mouse_check_button_pressed(mb_right)
m=1
if mouse_check_button_released(mb_left)// and !keyboard_check(vk_control)
{
m=3
if lstk>0
{
m=2
lstk=0
}
else
lstk=10
}
if mouse_check_button_released(mb_left) and keyboard_check(vk_control)
m=2
}
xx=0
yy=0
myy=0
b=0
sb=0
/*----deselect
if mx>-32
{
if m!=0 and m!=2
{
sel=-1
ds_list_clear(selp)
}
}
*/
//for (i=0; i<ds_list_size(com); i+=1)
//{
//draw_text(32+48*i,-48,string(ds_list_find_value(com,i)))
//}
erp=0
for (i=skp; i<ds_list_size(com); i+=1)
{
yy=HG[i]
if yy>view_yview[0]+view_wview[0]
{
i=ds_list_size(com)+10
break
}
t=''
psb=sb
sb=i
eif=0
if erp=2 erp=0

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
if global.a[0]=125 and erp=0
{
if xx<120
xx+=12
}
trig()

if t!=''
{
if eif=2
{
if xx>0
xx-=12
}
xxo=xx
if not ((yy>view_yview[0]+view_wview[0])or(yy+16+string_height(t)+8<view_yview[0]))
{

//if ds_list_find_index(OM,global.a[0])!=-1
//t+='#%color[990000]'+lstr(185)
//if string_width(t)>800-40-xx
//t=break_text(t,800-40-xx)
t=HT[i]
if ds_list_find_index(DS,global.a[0])!=-1
xx=0
if mx>=16 and mx<=800-16 and my>=yy+16 and my<=yy+16+string_height(t)+8
draw_set_color(c_gray)
else
{
if eif=0
draw_set_color(c_white)
else
draw_set_color(c_orange)
if ds_list_find_index(DS,global.a[0])!=-1
draw_set_color(c_teal)
if (global.a[0]=125 or global.a[0]=126)
draw_set_color(c_olive)
}

//if not ((yy>view_yview[0]+view_wview[0])or(yy+16+string_height(t)+8<view_yview[0]))
//{
if sel!=sb
draw_rectangle(xx+16,yy+16,800-16,yy+16+string_height(t)+8,0)
else
draw_rectangle_color(xx+16,yy+16,800-16,yy+16+string_height(t)+8,c_white,c_silver,c_navy,c_aqua,0)
draw_set_color(c_black)
draw_rectangle(xx+16,yy+16,800-16,yy+16+string_height(t)+8,1)
draw_set_font(font0)
draw_text_amazing(xx+20,yy+20,t)
//draw_text(xx+20,yy+20,t)
if erp!=0
{
draw_circle_color(xx+4,yy+28,4,c_red,c_lime,0)
}
}
xx=xxo

if eif=1
{
if xx<120
xx+=12
}
if global.a[0]=126 and erp=2
{
if xx>0
xx-=12
}

if sel=sb
{
psel=psb
}
if sel=psb
{
nsel=sb
nselb=b
}

if sbtn=1 and sb=0
{
sbtn=0
ds_list_clear(selp)
sel=sb
for (j=sb; j<sb+b; j+=1)
{
ds_list_add(selp,ds_list_find_value(com,j))
}
}
if sbtn=2 and sb=ds_list_size(com)-2
{
sbnt=0
ds_list_clear(selp)
sel=sb
for (j=sb; j<sb+b; j+=1)
{
ds_list_add(selp,ds_list_find_value(com,j))
}
}

if m=3 or delsel=sb
{
if (mx>=16 and mx<=800-16 and my>=yy+16 and my<=yy+16+string_height(t)+8) or delsel=sb
{
delsel=-1
ds_list_clear(selp)
sel=sb
for (j=sb; j<sb+b; j+=1)
{
ds_list_add(selp,ds_list_find_value(com,j))
}
}
}
if m=1
{
if mx>=16 and mx<=800-16 and my>=yy+16 and my<=yy+16+string_height(t)+8
{
wd_message_set_text(lstr(134))
if wd_message_show_pos(wd_mk_confirmation,wd_mb_yes,wd_mb_none,wd_mb_no,window_get_x()+320,window_get_y()+280)=wd_mb_yes
{
if ds_list_find_value(com,sb)=254 and ds_list_find_value(com,sb+1)=237
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
while b!=0
{
ds_list_delete(com,sb+(b-1))
b-=1
}
i=sb-1
m=0
delsel=sb
}
remap=1
}
}
}
if m=2 or BM=1 or keyboard_check_pressed(vk_enter)
{
var MFL
{
MFL=0
if m=2
{
if mx>=16 and mx<=800-16 and my>=yy+16 and my<=yy+16+string_height(t)+8
{
MFL=1
}
}
else
{
MFL=1
}
if MFL=1
{
BM=0
global.AN=0
if sel>=0 and sel<ds_list_size(com)-2
{
global.AP=sel
for (j=0; j<1024; j+=1)
{
global.ret[j]=-1
}
for (j=global.AP; j<global.AP+1024 and j<global.AP+ds_list_size(selp); j+=1)
{
global.ret[j-global.AP]=ds_list_find_value(com,j)
}
room_goto(room_ad)
}
}
}
}

yy+=string_height(t)+16
myy=yy-100
if myy<0
myy=0
}
}

draw_set_color(c_white)
draw_rectangle(16,yy+16,800-16,yy+16+24+8,0)
draw_set_color(c_black)
draw_rectangle(16,yy+16,800-16,yy+16+24+8,1)
draw_text(20,yy+20,lstr(140))

/*
if keyboard_check_released(vk_alt)
{
if yy+40>view_yview[0] and yy+40<view_yview[0]+view_hview[0]-16
if !instance_exists(smsmenu_main)
{
global.menu=''
global.menur=id
global.menuX=240
global.menuY=yy+40
instance_create(0,0,smsmenu_trig)
}
}


if sel>-1
{
if (keyboard_check_released(vk_up) and keyboard_check(vk_control)) or BU
{
if (sel>0) and (sel<ds_list_size(com)-2)
{
for (i=0; i<ds_list_size(selp); i+=1)
{
ds_list_delete(com,sel)
}
for (i=ds_list_size(selp)-1; i>=0; i-=1)
{
ds_list_insert(com,psel,ds_list_find_value(selp,i))
}
var yyy
{
yyy=HG[sel]
sel=psel
//view_yview[0]+=HG[sel]-yyy
if view_yview[0]>HG[sel]
view_yview[0]=HG[sel]-8
}
remap=1
}
}
if (keyboard_check_released(vk_down) and keyboard_check(vk_control)) or BD
{
if (nsel<ds_list_size(com)-2)
{
for (i=0; i<ds_list_size(selp); i+=1)
{
ds_list_delete(com,sel)
}
for (i=ds_list_size(selp)-1; i>=0; i-=1)
{
ds_list_insert(com,sel+nselb,ds_list_find_value(selp,i))
}
var yyy
{
yyy=HG[sel]
sel=sel+nselb
//view_yview[0]+=HG[sel]-yyy
if view_yview[0]+view_hview[0]<yyy+128
view_yview[0]=yyy-view_hview[0]+128
}
remap=1
}
}
}


if sbtn=1 or sbtn=2
sbtn=0
if sbtnn=0
sbtn=0
if sbtnn>0
sbtnn-=1
if sel!=-1
{
if sbtn=3 and sbtnn>0
{
if sel>=0
{
ds_list_clear(selp)
for (j=psel; j<sel; j+=1)
{
ds_list_add(selp,ds_list_find_value(com,j))
}
var yyy
{
yyy=HG[sel]
sel=psel
//view_yview[0]+=HG[sel]-yyy
if view_yview[0]>HG[sel]
view_yview[0]=HG[sel]-8
}
}
}
if sbtn=4 and sbtnn>0
{
if nsel<ds_list_size(com)-1
{
ds_list_clear(selp)
for (j=nsel; j<nsel+nselb; j+=1)
{
ds_list_add(selp,ds_list_find_value(com,j))
}
var yyy
{
yyy=HG[sel]
sel=nsel
//view_yview[0]+=HG[sel]-yyy
if view_yview[0]+view_hview[0]<HG[sel]+64
view_yview[0]=HG[sel]-view_hview[0]+64
}
}
}
if keyboard_check(vk_up) and !keyboard_check(vk_control)
{
if prs=0 or prs>8
{
if sel>=0
{
ds_list_clear(selp)
for (j=psel; j<sel; j+=1)
{
ds_list_add(selp,ds_list_find_value(com,j))
}
var yyy
{
yyy=HG[sel]
sel=psel
//view_yview[0]+=HG[sel]-yyy
if view_yview[0]>HG[sel]
view_yview[0]=HG[sel]-8
}
}
}
if prs<10
prs+=2
}
if keyboard_check(vk_down) and !keyboard_check(vk_control)
{
if prs=0 or prs>8
{
if sel<ds_list_size(com)-2 and nsel<ds_list_size(com)-1
{
ds_list_clear(selp)
for (j=nsel; j<nsel+nselb; j+=1)
{
ds_list_add(selp,ds_list_find_value(com,j))
}
var yyy
{
yyy=HG[sel]
sel=nsel
//view_yview[0]+=HG[sel]-yyy
if view_yview[0]+view_hview[0]<HG[sel]+128
view_yview[0]=HG[sel]-view_hview[0]+128
}
}
}
if prs<10
prs+=2
}
}
if keyboard_check_released(vk_up) or keyboard_check_released(vk_down)
prs=0