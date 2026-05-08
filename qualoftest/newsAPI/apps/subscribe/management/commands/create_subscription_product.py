# backend/apps/subscribe/management/commands/create_subscription_plans.py
from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.subscribe.models import SubscriptionPlan


class Command(BaseCommand):
    help = 'Create default subscription plans'

    def handle(self, *args, **options):
        # Базовий план підписки
        plan, created = SubscriptionPlan.objects.get_or_create(
            name='Premium Monthly',
            defaults={
                'price': 12.00,
                'duration_days': 30,
                'stripe_price_id': 'price_premium_monthly',
                'features': {
                    'pin_posts': True,
                    'priority_support': True,
                    'analytics': True
                },
                'is_active': True
            }
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created subscription plan: {plan.name}')
            )
        else:
            if plan.price < Decimal('0.50'):
                plan.price = Decimal('0.50')
                plan.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Updated {plan.name} price to {plan.price} so Stripe checkout can work'
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Subscription plan already exists: {plan.name}')
                )

        free_plan, free_created = SubscriptionPlan.objects.get_or_create(
            name='Безкоштовна підписка',
            defaults={
                'price': 0.00,
                'duration_days': 7,
                'stripe_price_id': 'free_plan',
                'features': 'Тестова безкоштовна підписка',
                'is_active': True
            }
        )

        if free_created:
            self.stdout.write(
                self.style.SUCCESS(f'Created free subscription plan: {free_plan.name}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Free subscription plan already exists: {free_plan.name}')
            )
        
        # 3. Тижневий план підписки (Premium Weekly)
        plan1, created1 = SubscriptionPlan.objects.get_or_create(
            name='Premium Weekly',
            defaults={
                'price': Decimal('0.50'),
                'duration_days': 7,
                'stripe_price_id': 'price_premium_weekly',
                'features': {
                    'pin_posts': True,
                    'priority_support': True,
                    'analytics': True
                },
                'is_active': True
            }
        )
        if created1:
            self.stdout.write(
                self.style.SUCCESS(f'Created subscription plan: {plan1.name}')
            )
        else:
            if plan1.price < Decimal('0.50'):
                plan1.price = Decimal('0.50')
                plan1.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Updated {plan1.name} price to {plan1.price} so Stripe checkout can work'
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Subscription plan already exists: {plan1.name}')
                )