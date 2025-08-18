from django.apps import AppConfig


class OnesokoappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'OneSokoApp'
    
    def ready(self):
        """
        Import signals when the app is ready to ensure they are connected.
        """
        import OneSokoApp.signals
