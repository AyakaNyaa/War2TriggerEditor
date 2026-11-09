depth-=2
A=1
B=0
alarm[0]=2
var_mmdraw = 0
var_smdraw = -1
var_smitem = -1
var_smfsize = -1

var_mmsize = 1
mmi[00] = ''
sms[00] = 0


if A=0
{
if mouse_check_button_released(mb_left)
{
if var_mmdraw = 1
{
var_mmdraw = 0
instance_destroy()
}

if var_smdraw != -1 && var_smitem != -1
{
global.menu=smi[var_smdraw,var_smitem]
if instance_exists(global.menur)
global.menur.mr=global.menu
}

}
}
else
{
A=0
var_mmdraw = 1;
draw_set_font(font_smsfont);
var_mmw = 0;
var_mmh = 0;
var_smw = 0;
var_smh = 0;
var_chksize = 0;

for (i = 0; i < var_mmsize; i += 1)
  {
  var_chksize = string_width(mmi[i]);
  if var_chksize > var_mmw
    { var_mmw = var_chksize; }
  if i = var_mmsize-1
    {
    var_mmw += 43;
    var_chksize = 0;
    }
  }
  
for (i = 0; i < var_mmsize; i += 1)
  {
  var_chksize = string_height(mmi[i]);
  if i < var_mmsize-1
    { var_chksize += 4; }
  if i = var_mmsize-1
    { var_chksize += 9; }
  var_mmh += var_chksize;
  var_chksize = 0;
  }
if global.menuX!=-1 and global.menuY!=-1
{
var_mmx1 = global.menuX;
var_mmy1 = global.menuY;
}
else
{
var_mmx1 = mouse_x;
var_mmy1 = mouse_y;
}
global.menuX=-1
global.menuY=-1
var_mmx2 = var_mmx1+var_mmw;
var_mmy2 = var_mmy1+var_mmh;
var_smx1 = var_mmx2-5;
}