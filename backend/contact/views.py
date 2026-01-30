from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import ContactMessage
from .serializers import ContactMessageSerializer

@api_view(['POST'])
def contact_view(request):
    """
    API endpoint pour recevoir les messages de contact
    """
    serializer = ContactMessageSerializer(data=request.data)
    
    if serializer.is_valid():
        # Sauvegarder le message dans la base de données
        contact_message = serializer.save()
        
        # Préparer l'email
        subject = f"🔔 Nouveau message de {contact_message.name}"
        message = f"""
Nouveau message reçu depuis le formulaire de contact :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Nom : {contact_message.name}
📧 Email : {contact_message.email}
📝 Sujet : {contact_message.subject}

💬 Message :
{contact_message.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Message reçu le {contact_message.created_at.strftime('%d/%m/%Y à %H:%M')}
        """
        
        try:
            # Envoyer l'email
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[settings.EMAIL_HOST_USER],
                fail_silently=False,
            )
            
            return Response({
                'success': True,
                'message': 'Message envoyé avec succès ! Je vous répondrai dans les plus brefs délais.'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Si l'email échoue, on garde quand même le message en BDD
            return Response({
                'success': True,
                'message': 'Message enregistré, mais l\'email n\'a pas pu être envoyé.',
                'error': str(e)
            }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
