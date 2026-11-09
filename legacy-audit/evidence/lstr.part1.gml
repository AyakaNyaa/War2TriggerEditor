if global.SZ+argument0<ds_list_size(global.LANG)
return string(ds_list_find_value(global.LANG,global.SZ+argument0))
else
return '%*string line error*%'