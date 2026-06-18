from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dealerships', '0004_alter_showroomcar_unique_together_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='showroom',
            name='work_start',
            field=models.TimeField(default='09:00'),
        ),
        migrations.AddField(
            model_name='showroom',
            name='work_end',
            field=models.TimeField(default='19:00'),
        ),
    ]
