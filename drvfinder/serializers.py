from rest_framework import serializers
from drvfinder.models import Snippet


class SnippetSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    title = serializers.CharField(required=False, allow_blank=True, max_length=100)
    lattitude = serializers.CharField(required=False, allow_blank=True, max_length=100)
    longitude = serializers.CharField(required=False, allow_blank=True, max_length=100)

    def create(self, validated_data):
        """
        Create and return a new `Snippet` instance, given the validated data.
        """
        return Snippet.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing `Snippet` instance, given the validated data.
        """
        instance.title = validated_data.get('title', instance.title)
        lattitude = validated_data.get('lattitude', instance.lattitude)
        longitude = validated_data.get('longitude', instance.longitude)
        instance.save()
        return instance
