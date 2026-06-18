from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0006_testdriverequest_preferred_time_reminder_sent'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='testdriverequest',
            name='employee',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='test_drive_requests',
                to='users.employee',
            ),
        ),
    ]
