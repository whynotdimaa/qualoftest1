from rest_framework import serializers
from django.utils.text import slugify
from .models import Category, Post


def _safe_media_url(fieldfile, request):
    try:
        if fieldfile:
            url = fieldfile.url
            if request:
                return request.build_absolute_uri(url)
            return url
    except Exception:
        pass
    return None


class CategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description','posts_count')
        read_only_fields = ('slug', 'created_at')

    def get_posts_count(self, obj):
        return obj.posts.filter(status='published').count()

    def create(self, validated_data):
        validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)

class PostListSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    comments_count = serializers.ReadOnlyField()
    is_pinned = serializers.ReadOnlyField()
    pinned_info = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content', 'image',
            'category', 'author', 'status', 'created_at',
            'updated_at', 'views_count', 'comments_count', 'is_pinned', 'pinned_info',
        ]
        read_only_fields = ('slug', 'author', 'views_count',)

    def get_author(self, obj):
        if obj.author is None:
            return None
        return str(obj.author)

    def get_category(self, obj):
        if obj.category is None:
            return None
        return str(obj.category)

    def get_image(self, obj):
        request = self.context.get('request')
        return _safe_media_url(obj.image, request)

    def get_pinned_info(self, obj):
        return obj.get_pinned_info()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if len(data['content']) > 200:
            data['content'] = data['content'][:200] + '...'
        return data

class PostDetailSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    author_info = serializers.SerializerMethodField()
    category_info = serializers.SerializerMethodField()
    comments_count = serializers.ReadOnlyField()
    is_pinned = serializers.ReadOnlyField()
    pinned_info = serializers.SerializerMethodField()
    can_pin = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content', 'image',
            'category', 'author', 'status', 'created_at',
            'updated_at', 'views_count', 'comments_count', 'author_info',
            'category_info', 'is_pinned', 'pinned_info', 'can_pin',
        ]
        read_only_fields = ('slug', 'author', 'views_count')

    def get_image(self, obj):
        request = self.context.get('request')
        return _safe_media_url(obj.image, request)

    def get_author(self, obj):
        if obj.author is None:
            return None
        return str(obj.author)

    def get_category(self, obj):
        if obj.category is None:
            return None
        return str(obj.category)

    def get_author_info(self, obj):
        author = obj.author
        if author is None:
            return None
        request = self.context.get('request')
        return {
            'id': author.id,
            'username': author.username,
            'full_name': author.full_name,
            'avatar': _safe_media_url(author.avatar, request),
        }

    def get_category_info(self, obj):
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'slug': obj.category.slug,
            }
        return None

    def get_pinned_info(self, obj):
        return obj.get_pinned_info()

    def get_can_pin(self,obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.can_be_pinned_by(request.user)

class PostCreateSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(read_only=True)

    class Meta:
        model = Post
        fields = ['title', 'slug', 'content', 'image', 'category', 'status']

    def create(self, validated_data):
        validated_data['slug'] = slugify(validated_data['title'])
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'title' in validated_data:
            validated_data['slug'] = slugify(validated_data['title'])
        return super().update(instance, validated_data)