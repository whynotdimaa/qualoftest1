from rest_framework import serializers
from .models import Comment
from apps.main.models import Post


def _safe_avatar_url(author):
    try:
        if author.avatar:
            return author.avatar.url
    except Exception:
        pass
    return None


class CommentSerializer(serializers.ModelSerializer):
    author_info = serializers.SerializerMethodField()
    replies_count = serializers.ReadOnlyField()
    is_reply = serializers.ReadOnlyField()
    post_slug = serializers.CharField(source="post.slug", read_only=True)
    post_title = serializers.CharField(source="post.title", read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id',
            'post',
            'post_slug',
            'post_title',
            'content',
            'author_info',
            'parent',
            'is_active',
            'created_at',
            'updated_at',
            'author',
            'is_reply',
            'replies_count',
        ]
        read_only_fields = ['author', 'is_active']

    def get_author_info(self, obj):
        return {
            'id': obj.author.id,
            'username': obj.author.username,
            'full_name': obj.author.full_name,
            'avatar': _safe_avatar_url(obj.author),
        }
class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['post', 'parent' ,'content']

    def validate_post(self, value):
        if not Post.objects.filter(id=value.id, status = 'published').exists():
            raise serializers.ValidationError('Post does not exist')
        return value

    def validate_parent(self, value):
        if value:
            post_data = self.initial_data.get('post')
            if post_data:
                if value.post.id != int(post_data):
                    raise serializers.ValidationError('Post id does not match post id')
        return value

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class CommentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content']


class CommentDetailSerializer(CommentSerializer):
    replies = serializers.SerializerMethodField()

    class Meta(CommentSerializer.Meta):
        fields = CommentSerializer.Meta.fields + ['replies']

    def get_replies(self, obj):
        if obj.parent is None:
            qs = obj.replies.filter(is_active=True).order_by('created_at')
            return CommentSerializer(qs, many=True, context=self.context).data
        return []

