import os
import subprocess
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Build the React frontend application'

    def add_arguments(self, parser):
        parser.add_argument(
            '--production',
            action='store_true',
            help='Build for production with optimizations',
        )

    def handle(self, *args, **options):
        frontend_dir = os.path.join(settings.BASE_DIR, 'OneSokoApp', 'OneSokoFrontend')
        
        if not os.path.exists(frontend_dir):
            self.stdout.write(
                self.style.ERROR(f'Frontend directory not found at {frontend_dir}')
            )
            return

        try:
            # Change to frontend directory
            os.chdir(frontend_dir)
            
            # Install dependencies if node_modules doesn't exist
            if not os.path.exists('node_modules'):
                self.stdout.write(self.style.SUCCESS('Installing npm dependencies...'))
                subprocess.run(['npm', 'install'], check=True)
            
            # Build the frontend
            build_command = ['npm', 'run', 'build']
            if options['production']:
                # Add any production-specific build flags here
                pass
                
            self.stdout.write(self.style.SUCCESS('Building React frontend...'))
            subprocess.run(build_command, check=True)
            
            # Copy dist files to Django static directory
            dist_dir = os.path.join(frontend_dir, 'dist')
            if os.path.exists(dist_dir):
                self.stdout.write(self.style.SUCCESS('Frontend build completed successfully!'))
                self.stdout.write(f'Built files are in: {dist_dir}')
            else:
                self.stdout.write(self.style.ERROR('Build failed - dist directory not found'))
                
        except subprocess.CalledProcessError as e:
            self.stdout.write(
                self.style.ERROR(f'Build failed with error: {e}')
            )
        except FileNotFoundError:
            self.stdout.write(
                self.style.ERROR('npm not found. Please install Node.js and npm.')
            )
