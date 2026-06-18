from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cars', '0006_replace_carimage_with_cartrimimage'),
    ]

    operations = [
        migrations.AddField(
            model_name='cartrimimage',
            name='is_default',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='cartrimimage',
            name='color_name',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
        migrations.AddIndex(
            model_name='cartrimimage',
            index=models.Index(fields=['trim', 'is_default'], name='cars_cartri_trim_id_isdef_idx'),
        ),
        # Существующие записи с color_hex='' — это дефолтные фото
        migrations.RunSQL(
            sql="UPDATE cars_cartrimimage SET is_default = TRUE WHERE color_hex = '';",
            reverse_sql="UPDATE cars_cartrimimage SET is_default = FALSE;",
        ),
    ]
