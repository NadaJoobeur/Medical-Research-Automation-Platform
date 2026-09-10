from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import *


project_bp = Blueprint('project', __name__)

@project_bp.route('/projects', methods=['POST'])
@jwt_required()
def add_project():
    data = request.get_json()
    new_project = Project(name=data['name'], user_id=get_jwt_identity(),typePrj=data['type'])
    db.session.add(new_project)
    db.session.commit()
    return jsonify(message='Project created successfully', project_id=new_project.id), 201

@project_bp.route('/projects/<int:user_id>', methods=['GET'])
@jwt_required()
def get_projects(user_id):
    projects = Project.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': project.id, 'name': project.name , 'type':project.typePrj} for project in projects])

@project_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify(message='Project deleted successfully'), 200
