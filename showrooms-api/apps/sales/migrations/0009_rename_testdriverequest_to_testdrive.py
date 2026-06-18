from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0008_add_day_reminder_sent'),
    ]

    operations = [
        migrations.DeleteModel(name='TestDrive'),
        migrations.RenameModel(old_name='TestDriveRequest', new_name='TestDrive'),
    ]
