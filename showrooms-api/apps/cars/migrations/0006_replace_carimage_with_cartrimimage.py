import uuid
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cars', '0005_add_color_mileage_trimname'),
    ]

    operations = [
        migrations.DeleteModel(
            name='CarImage',
        ),
        migrations.CreateModel(
            name='CarTrimImage',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('color_hex', models.CharField(blank=True, default='', max_length=7)),
                ('image', models.ImageField(upload_to='trim_images/')),
                ('order', models.PositiveSmallIntegerField(default=0)),
                ('trim', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='images',
                    to='cars.cartrim',
                )),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.AddIndex(
            model_name='cartrimimage',
            index=models.Index(fields=['trim', 'color_hex'], name='cars_cartri_trim_id_color_idx'),
        ),
    ]
