from django.contrib import admin
from drvfinder.models import Driver,Snippet

class DriverAdmin(admin.ModelAdmin):

        list_display = ('id','image_tag', 'driver_name', 'driver_phone')
        readonly_fields = ('image_tag',)
        search_fields = ['driver_name']
        list_filter = ('driver_name', 'driver_phone')
        pass


admin.site.register(Driver,DriverAdmin)
admin.site.register(Snippet)
