from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0005_testdriverequest_config_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='testdriverequest',
            name='preferred_time',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='testdriverequest',
            name='reminder_sent',
            field=models.BooleanField(default=False),
        ),
    ]
