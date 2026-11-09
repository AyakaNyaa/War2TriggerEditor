switch (global.ret[1])
{
case 0:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,0)
o.T=3
o.b=2
break;
case 1:break;
case 2:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,2)
o.T=4
o.b=2
o=instance_create(240,240,field)
o.tu=lstr(13)
o.T=5
o.b=5
creator6_1()
break;
case 3:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,3)
o.T=24
o.b=2
creator6_1()
break;
case 4:break;
case 5:break;
case 6:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,6)
o.T=1
o.b=2
o.bb=1
o.mx=255
o.mn=0
break;
case 7:break;
case 8:
o=instance_create(24,240,field)
o.tu="X"
o.T=1
o.b=2
o.bb=1
o.mx=127
o.mn=0
o=instance_create(240,240,field)
o.tu="Y"
o.T=1
o.b=3
o.bb=1
o.mx=127
o.mn=0
break;
case 9:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,9)
o.T=2
o.b=2
break;
case 10:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,10)
o.T=1
o.b=2
o.bb=2
o.mx=65535
o.mn=0
break;
case 11:break;
case 12:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,12)
o.T=26
o.b=2
o=instance_create(24,240,field)
o.tu="X"
o.T=1
o.b=3
o.bb=1
o.mx=127
o.mn=0
o=instance_create(240,240,field)
o.tu="Y"
o.T=1
o.b=4
o.bb=1
o.mx=127
o.mn=0
break;
case 13:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,13)
o.T=1
o.b=2
o.bb=2
o.mx=65535
o.mn=0
break;
case 14:break;
case 15:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,15)
o.T=29
o.b=2
break;
case 16:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,16)
o.T=27
o.b=2
break;
case 17:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,17)
o.T=27
o.b=2
break;
case 18:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,18)
o.T=1
o.b=3
o.bb=1
o.mx=127
o.mn=0
o=instance_create(24,240,checkbox)
o.tu=ds_list_find_value(drawer2.lp,0)
o.T=0
o=instance_create(160,240,checkbox)
o.tu=ds_list_find_value(drawer2.lp,1)
o.T=1
o=instance_create(280,240,checkbox)
o.tu=ds_list_find_value(drawer2.lp,2)
o.T=2
o=instance_create(400,240,checkbox)
o.tu=ds_list_find_value(drawer2.lp,3)
o.T=3
o=instance_create(24,300,checkbox)
o.tu=ds_list_find_value(drawer2.lp,4)
o.T=4
o=instance_create(160,300,checkbox)
o.tu=ds_list_find_value(drawer2.lp,5)
o.T=5
o=instance_create(280,300,checkbox)
o.tu=ds_list_find_value(drawer2.lp,6)
o.T=6
o=instance_create(400,300,checkbox)
o.tu=ds_list_find_value(drawer2.lp,7)
o.T=7
if global.ret[2]=-1
global.ret[2]=0
break;
case 19:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,19)
o.T=1
o.b=2
o.bb=1
o.mx=127
o.mn=0
break;
case 20:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,20)
o.T=31
o.b=2
break;
case 21:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,20)
o.T=31
o.b=2
break;
case 22:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,22)
o.T=32
o.b=2
o=instance_create(240,240,field)
o.tu=lstr(13)
o.T=5
o.b=4
o=instance_create(24,240,field)
o.tu=lstr(9)
o.T=1
o.b=3
o.bb=1
o.mx=255
o.mn=0
break;
case 23:
o=instance_create(24,240,field)
o.tu=lstr(227)
o.T=1
o.b=2
o.bb=2
o.mx=65535
o.mn=0
break;
case 24:
o=instance_create(240,160,field)
o.tu='Player'
o.T=2
o.b=2
o=instance_create(24,240,field)
o.tu=lstr(6)
o.T=0
o.b=3
break;
case 25:
o=instance_create(240,160,field)
o.tu=ds_list_find_value(drawer2.ltu,13)
o.T=1
o.b=2
o.bb=2
o.mx=65535
o.mn=0
o=instance_create(24,240,field)
o.tu='Player'
o.T=2
o.b=4
break;
case 26:break;
case 27:
o=instance_create(24,240,field)
o.tu=lstr(9)
o.T=1
o.b=2
o.bb=1
o.mx=255
o.mn=0
o=instance_create(240,240,field)
o.tu=lstr(9)
o.T=1
o.b=3
o.bb=1
o.mx=255
o.mn=0
break;
default:break;
}