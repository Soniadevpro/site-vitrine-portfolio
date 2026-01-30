from rest_framework import serializers
from .models import ContactMessage

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate_email(self, value):
        """Validation de l'email"""
        if '@' not in value:
            raise serializers.ValidationError("Email invalide")
        return value.lower()
    
    def validate_message(self, value):
        """Le message doit faire au moins 10 caractères"""
        if len(value) < 10:
            raise serializers.ValidationError("Le message doit contenir au moins 10 caractères")
        return value
    
    def validate_name(self, value):
        """Le nom doit faire au moins 2 caractères"""
        if len(value) < 2:
            raise serializers.ValidationError("Le nom doit contenir au moins 2 caractères")
        return value