from django.db import models

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
