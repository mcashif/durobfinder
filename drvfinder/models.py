from django.db import models
from django.utils.safestring import mark_safe

# Create your models here.
class Driver(models.Model):
      driver_name = models.CharField(max_length=50, verbose_name='Driver Name')
      driver_picture = models.ImageField(upload_to='documents', default = 'documents/no-img.jpeg', verbose_name='Driver Picture')
      driver_passport_picture = models.ImageField(upload_to='documents', default = 'documents/no-img.jpeg', verbose_name='Driver Passport Picture')
      driver_phone = models.CharField(max_length=200, blank=True, verbose_name='Driver Phone')
      def __str__(self):
          return self.driver_name
      def image_tag(self):
          return mark_safe('<img src="%s" width="150" height="150" />' % (self.driver_picture.url))

      image_tag.short_description = 'Image'

      class Meta:
        verbose_name_plural = "Driver Details"

# Create your models here.
class Snippet(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100, blank=True, default='')
    lattitude = models.TextField()
    longitude = models.TextField()

    def __str__(self):
        return self.title

    class Meta:
        ordering = ('created',)
