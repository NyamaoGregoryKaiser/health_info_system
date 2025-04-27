from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
import sys

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates or resets an API token for a user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username to create/reset token for')
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset the token if it already exists',
        )

    def handle(self, *args, **options):
        username = options['username']
        reset = options['reset']
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(f'User "{username}" does not exist')
        
        try:
            token = Token.objects.get(user=user)
            
            if not reset:
                self.stdout.write(self.style.WARNING(
                    f'Token already exists for user "{username}". '
                    'Use --reset to generate a new token.'
                ))
                return
                
            token.delete()
            self.stdout.write(self.style.SUCCESS(f'Existing token for "{username}" deleted.'))
        except Token.DoesNotExist:
            pass
        
        # Create a new token
        token = Token.objects.create(user=user)
        
        self.stdout.write('\n')
        self.stdout.write(self.style.SUCCESS(f'API token for user "{username}" created successfully:'))
        self.stdout.write('\n')
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(self.style.SUCCESS(f'TOKEN: {token.key}'))
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write('\n')
        self.stdout.write(self.style.WARNING('IMPORTANT: Store this token securely! It will not be shown again.'))
        self.stdout.write('\n')
        self.stdout.write(self.style.SUCCESS(f'Usage: Authorization: Token {token.key}'))
        self.stdout.write('\n') 