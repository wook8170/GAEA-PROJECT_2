# Generated migration for new CE features

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0120_issueview_archived_at"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # StateTransition
        migrations.CreateModel(
            name="StateTransition",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ("is_allowed", models.BooleanField(default=True)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_created_by", to=settings.AUTH_USER_MODEL, verbose_name="Created By")),
                ("updated_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_updated_by", to=settings.AUTH_USER_MODEL, verbose_name="Last Modified By")),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="state_transitions", to="db.project")),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="state_transitions", to="db.workspace")),
                ("from_state", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="transitions_from", to="db.state")),
                ("to_state", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="transitions_to", to="db.state")),
            ],
            options={
                "verbose_name": "State Transition",
                "verbose_name_plural": "State Transitions",
                "db_table": "state_transitions",
                "ordering": ("from_state__sequence", "to_state__sequence"),
            },
        ),
        migrations.AddConstraint(
            model_name="statetransition",
            constraint=models.UniqueConstraint(
                condition=models.Q(("deleted_at__isnull", True)),
                fields=("project", "from_state", "to_state"),
                name="state_transition_unique_when_deleted_at_null",
            ),
        ),
        # TeamMember
        migrations.CreateModel(
            name="TeamMember",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ("role", models.PositiveSmallIntegerField(choices=[(5, "Guest"), (10, "Viewer"), (15, "Member"), (20, "Admin")], default=15)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_created_by", to=settings.AUTH_USER_MODEL, verbose_name="Created By")),
                ("updated_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_updated_by", to=settings.AUTH_USER_MODEL, verbose_name="Last Modified By")),
                ("team", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="team_members", to="db.team")),
                ("member", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="team_memberships", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "verbose_name": "Team Member",
                "verbose_name_plural": "Team Members",
                "db_table": "team_members",
                "ordering": ("-created_at",),
            },
        ),
        migrations.AddConstraint(
            model_name="teammember",
            constraint=models.UniqueConstraint(
                condition=models.Q(("deleted_at__isnull", True)),
                fields=("team", "member"),
                name="team_member_unique_when_deleted_at_null",
            ),
        ),
        # TeamProject
        migrations.CreateModel(
            name="TeamProject",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ("sort_order", models.FloatField(default=65535)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_created_by", to=settings.AUTH_USER_MODEL, verbose_name="Created By")),
                ("updated_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_updated_by", to=settings.AUTH_USER_MODEL, verbose_name="Last Modified By")),
                ("team", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="team_projects", to="db.team")),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="project_teams", to="db.project")),
            ],
            options={
                "verbose_name": "Team Project",
                "verbose_name_plural": "Team Projects",
                "db_table": "team_projects",
                "ordering": ("sort_order",),
            },
        ),
        migrations.AddConstraint(
            model_name="teamproject",
            constraint=models.UniqueConstraint(
                condition=models.Q(("deleted_at__isnull", True)),
                fields=("team", "project"),
                name="team_project_unique_when_deleted_at_null",
            ),
        ),
        # IssueProperty
        migrations.CreateModel(
            name="IssueProperty",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("property_type", models.CharField(choices=[("text", "Text"), ("number", "Number"), ("select", "Select"), ("multi_select", "Multi Select"), ("date", "Date"), ("checkbox", "Checkbox"), ("url", "URL"), ("email", "Email"), ("file", "File"), ("relation", "Relation")], default="text", max_length=20)),
                ("is_required", models.BooleanField(default=False)),
                ("is_multi", models.BooleanField(default=False)),
                ("default_value", models.JSONField(blank=True, null=True)),
                ("options", models.JSONField(blank=True, default=list)),
                ("sort_order", models.FloatField(default=65535)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_created_by", to=settings.AUTH_USER_MODEL, verbose_name="Created By")),
                ("updated_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_updated_by", to=settings.AUTH_USER_MODEL, verbose_name="Last Modified By")),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="issue_properties", to="db.workspace")),
                ("issue_type", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="properties", to="db.issuetype")),
            ],
            options={
                "verbose_name": "Issue Property",
                "verbose_name_plural": "Issue Properties",
                "db_table": "issue_properties",
                "ordering": ("sort_order",),
            },
        ),
        migrations.AddConstraint(
            model_name="issueproperty",
            constraint=models.UniqueConstraint(
                condition=models.Q(("deleted_at__isnull", True)),
                fields=("workspace", "issue_type", "name"),
                name="issue_property_unique_when_deleted_at_null",
            ),
        ),
        # IssuePropertyValue
        migrations.CreateModel(
            name="IssuePropertyValue",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ("value", models.JSONField(default=dict)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_created_by", to=settings.AUTH_USER_MODEL, verbose_name="Created By")),
                ("updated_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_updated_by", to=settings.AUTH_USER_MODEL, verbose_name="Last Modified By")),
                ("issue", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="property_values", to="db.issue")),
                ("property", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="values", to="db.issueproperty")),
            ],
            options={
                "verbose_name": "Issue Property Value",
                "verbose_name_plural": "Issue Property Values",
                "db_table": "issue_property_values",
            },
        ),
        migrations.AddConstraint(
            model_name="issuepropertyvalue",
            constraint=models.UniqueConstraint(
                condition=models.Q(("deleted_at__isnull", True)),
                fields=("issue", "property"),
                name="issue_property_value_unique_when_deleted_at_null",
            ),
        ),
        # IssueTemplate
        migrations.CreateModel(
            name="IssueTemplate",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("template_data", models.JSONField(default=dict)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_created_by", to=settings.AUTH_USER_MODEL, verbose_name="Created By")),
                ("updated_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_updated_by", to=settings.AUTH_USER_MODEL, verbose_name="Last Modified By")),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="issue_templates", to="db.workspace")),
                ("project", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="issue_templates", to="db.project")),
            ],
            options={
                "verbose_name": "Issue Template",
                "verbose_name_plural": "Issue Templates",
                "db_table": "issue_templates",
                "ordering": ("name",),
            },
        ),
        migrations.AddConstraint(
            model_name="issuetemplate",
            constraint=models.UniqueConstraint(
                condition=models.Q(("deleted_at__isnull", True)),
                fields=("workspace", "project", "name"),
                name="issue_template_unique_when_deleted_at_null",
            ),
        ),
        # ProjectTemplate
        migrations.CreateModel(
            name="ProjectTemplate",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("template_data", models.JSONField(default=dict)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_created_by", to=settings.AUTH_USER_MODEL, verbose_name="Created By")),
                ("updated_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_updated_by", to=settings.AUTH_USER_MODEL, verbose_name="Last Modified By")),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="project_templates", to="db.workspace")),
            ],
            options={
                "verbose_name": "Project Template",
                "verbose_name_plural": "Project Templates",
                "db_table": "project_templates",
                "ordering": ("name",),
            },
        ),
        migrations.AddConstraint(
            model_name="projecttemplate",
            constraint=models.UniqueConstraint(
                condition=models.Q(("deleted_at__isnull", True)),
                fields=("workspace", "name"),
                name="project_template_unique_when_deleted_at_null",
            ),
        ),
    ]
