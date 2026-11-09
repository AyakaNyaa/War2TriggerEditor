switch (global.ret[2])
{
case 44:
o=instance_create(24,240,field)
o.tu=ds_list_find_value(drawer2.lg,global.ret[2])
o.T=2
o.b=3
o.bb=2
global.ret[4]=0
break;
case 37:
case 39:
case 43:
o=instance_create(24,240,field)
o.tu=ds_list_find_value(drawer2.lg,global.ret[2])
o.T=14
o.b=3
o.bb=2
global.ret[4]=0
break;
case 42:
o=instance_create(24,240,field)
o.tu=ds_list_find_value(drawer2.lg,global.ret[2])
o.T=25
o.b=3
o.bb=2
global.ret[4]=0
break;
case 46:
case 47:
o=instance_create(24,240,field)
o.tu=ds_list_find_value(drawer2.lg,global.ret[2])
o.T=26
o.b=3
o.bb=2
global.ret[4]=0
break;
case 45:
o=instance_create(24,240,field)
o.tu=lstr(14)
o.T=1
o.b=3
o.bb=2
o.mx=255
o.mn=0
global.ret[3]=0
global.ret[4]=0
break;
default:
o=instance_create(24,240,field)
o.tu=lstr(14)
o.T=1
o.b=3
o.bb=2
o.mx=65535
o.mn=0
global.ret[3]=0
global.ret[4]=0
break;
}