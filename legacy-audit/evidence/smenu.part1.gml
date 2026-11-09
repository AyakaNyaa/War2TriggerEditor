{
draw_set_color(c_black);
draw_set_alpha(.011); draw_rectangle(var_mmx1+10,var_mmy1+10,var_mmx2+6,var_mmy2+6,0);
draw_set_alpha(.043); draw_rectangle(var_mmx1+9,var_mmy1+9,var_mmx2+5,var_mmy2+5,0);
draw_set_alpha(.120); draw_rectangle(var_mmx1+8,var_mmy1+8,var_mmx2+4,var_mmy2+4,0);
draw_set_alpha(.193); draw_rectangle(var_mmx1+8,var_mmy1+8,var_mmx2+3,var_mmy2+3,0);
draw_set_alpha(.170); draw_rectangle(var_mmx1+9,var_mmy1+9,var_mmx2+2,var_mmy2+2,0);
draw_set_alpha(1);
draw_set_color(c_white);
draw_rectangle(var_mmx1,var_mmy1,var_mmx2,var_mmy2,0);
draw_set_color(make_color_rgb(241,239,226));
draw_rectangle(var_mmx1,var_mmy1,var_mmx2,var_mmy2,1);
draw_set_color(make_color_rgb(113,111,100));
draw_line(var_mmx2,var_mmy1,var_mmx2,var_mmy2+1);
draw_line(var_mmx1,var_mmy2,var_mmx2,var_mmy2);
draw_set_color(make_color_rgb(236,233,216));
draw_rectangle(var_mmx1+2,var_mmy1+2,var_mmx2-2,var_mmy2-2,1);
draw_set_color(make_color_rgb(172,168,153));
draw_line(var_mmx2-1,var_mmy1+1,var_mmx2-1,var_mmy2);
draw_line(var_mmx1+1,var_mmy2-1,var_mmx2-1,var_mmy2-1);

draw_set_color(c_black);
for (i = 0; i < var_mmsize; i += 1)
  { draw_text(var_mmx1+19,var_mmy1+4+(17*i),mmi[i]); }

for (i = 0; i < var_mmsize; i += 1)
  { draw_triangle(var_mmx2-12,var_mmy1+6+(17*i),var_mmx2-12,var_mmy1+14+(17*i),var_mmx2-8,var_mmy1+10+(17*i),0); }

for (i = 0; i < var_mmsize; i += 1)
  {
  if (mouse_x >= var_mmx1+3 && mouse_x <= var_mmx2-2 and mouse_y >= var_mmy1+3+(17*i) && mouse_y < var_mmy1+20+(17*i))
    {
    //if mouse_y >= var_mmy1+3+(17*i) && mouse_y < var_mmy1+20+(17*i)
      {
      draw_set_color(make_color_rgb(49,106,197));
      draw_rectangle(var_mmx1+3,var_mmy1+3+(17*i),var_mmx2-2,var_mmy1+20+(17*i),0);
      draw_set_color(c_white);
      draw_text(var_mmx1+19,var_mmy1+4+(17*i),mmi[i]);
      draw_triangle(var_mmx2-12,var_mmy1+6+(17*i),var_mmx2-12,var_mmy1+14+(17*i),var_mmx2-8,var_mmy1+10+(17*i),0);
      var_smdraw = i;
      }
    }
  }

if var_smdraw > -1 && var_smfsize != var_smdraw
  {
  var_smw = 0;
  var_smh = 0;

  for (i = 0; i < sms[var_smdraw]; i += 1)
    {
    var_chksize = string_width(smi[var_smdraw,i]);
    if var_chksize > var_smw
      { var_smw = var_chksize; }
    if i = sms[var_smdraw]-1
      {
      var_smw += 43;
      var_chksize = 0;
      }
    }
  
  for (i = 0; i < sms[var_smdraw]; i += 1)
    {
    var_chksize = string_height(smi[var_smdraw,i]);
    if i < sms[var_smdraw]-1
      { var_chksize += 1; }
    if i = sms[var_smdraw]-1
      { var_chksize += 9; }
    var_smh += var_chksize;
    var_chksize = 0;
    }
  var_smy1 = var_mmy1+(17*var_smdraw);
  var_smx2 = var_smx1+var_smw;
  var_smy2 = var_smy1+var_smh;
  var_smfsize = var_smdraw;
  }

if var_smdraw > -1
  {
  var_smy1 = var_mmy1+(17*var_smdraw);
  var_smx2 = var_smx1+var_smw;
  var_smy2 = var_smy1+var_smh;

  draw_set_color(c_black);
  draw_set_alpha(.011); draw_rectangle(var_smx1+10,var_smy1+10,var_smx2+6,var_smy2+6,0);
  draw_set_alpha(.043); draw_rectangle(var_smx1+9,var_smy1+9,var_smx2+5,var_smy2+5,0);
  draw_set_alpha(.120); draw_rectangle(var_smx1+8,var_smy1+8,var_smx2+4,var_smy2+4,0);
  draw_set_alpha(.193); draw_rectangle(var_smx1+8,var_smy1+8,var_smx2+3,var_smy2+3,0);
  draw_set_alpha(.170); draw_rectangle(var_smx1+9,var_smy1+9,var_smx2+2,var_smy2+2,0);
  draw_set_alpha(1);
  draw_set_color(c_white);
  draw_rectangle(var_smx1,var_smy1,var_smx2,var_smy2,0);
  draw_set_color(make_color_rgb(241,239,226));
  draw_rectangle(var_smx1,var_smy1,var_smx2,var_smy2,1);
  draw_set_color(make_color_rgb(113,111,100));
  draw_line(var_smx2,var_smy1,var_smx2,var_smy2+1);
  draw_line(var_smx1,var_smy2,var_smx2,var_smy2);
  draw_set_color(make_color_rgb(236,233,216));
  draw_rectangle(var_smx1+2,var_smy1+2,var_smx2-2,var_smy2-2,1);
  draw_set_color(make_color_rgb(172,168,153));
  draw_line(var_smx2-1,var_smy1+1,var_smx2-1,var_smy2);
  draw_line(var_smx1+1,var_smy2-1,var_smx2-1,var_smy2-1);

  draw_set_color(c_black);
  for (i = 0; i < sms[var_smdraw]; i += 1)
    { draw_text(var_smx1+19,var_smy1+4+(17*i),smi[var_smdraw,i]); }

  for (i = 0; i < sms[var_smdraw]; i += 1)
    {
    if mouse_x >= var_smx1+4 && mouse_x <= var_smx2-2
      {
      if mouse_y >= var_smy1+3+(17*i) && mouse_y < var_smy1+20+(17*i)
        {
        draw_set_color(make_color_rgb(49,106,197));
        draw_rectangle(var_smx1+3,var_smy1+3+(17*i),var_smx2-2,var_smy1+20+(17*i),0);
        draw_rectangle(var_mmx1+3,var_mmy1+3+(17*var_smdraw),var_mmx2-5,var_mmy1+20+(17*var_smdraw),0);
        draw_set_color(c_white);
        draw_text(var_smx1+19,var_smy1+4+(17*i),smi[var_smdraw,i]);
        draw_text(var_mmx1+19,var_mmy1+4+(17*var_smdraw),mmi[var_smdraw]);
        draw_triangle(var_mmx2-12,var_mmy1+6+(17*var_smdraw),var_mmx2-12,var_mmy1+14+(17*var_smdraw),var_mmx2-8,var_mmy1+10+(17*var_smdraw),0);
        var_smitem = i;
        }
      }
    else var_smitem = -1;
    }
  }
}