from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('feedback', '0001_initial'),
        ('users', '0007_add_client_telegram_username'),
        ('cars', '0008_test_drive_request'),
        ('sales', '0009_rename_testdriverequest_to_testdrive'),
    ]

    operations = [
        # Drop old polymorphic fields
        migrations.RemoveField(model_name='review', name='client'),
        migrations.RemoveField(model_name='review', name='content_type'),
        migrations.RemoveField(model_name='review', name='object_id'),
        migrations.RemoveField(model_name='review', name='review_owner'),

        # Change rating to PositiveSmallIntegerField
        migrations.AlterField(
            model_name='review',
            name='rating',
            field=models.PositiveSmallIntegerField(),
        ),

        # Add new FK fields
        migrations.AddField(
            model_name='review',
            name='user',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='reviews',
                to='users.user',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='review',
            name='car_model',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='reviews',
                to='cars.carmodel',
            ),
        ),
        migrations.AddField(
            model_name='review',
            name='test_drive',
            field=models.OneToOneField(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='review',
                to='sales.testdrive',
            ),
        ),

        # Make user NOT NULL now that existing rows are gone
        migrations.AlterField(
            model_name='review',
            name='user',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='reviews',
                to='users.user',
            ),
        ),

        # Unique constraint
        migrations.AddConstraint(
            model_name='review',
            constraint=models.UniqueConstraint(
                condition=models.Q(car_model__isnull=False),
                fields=['user', 'car_model'],
                name='unique_user_car_model_review',
            ),
        ),
    ]
