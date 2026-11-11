/// Domain User Model for Kirana store owner/user
class UserModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String? storeName;
  final String? storeAddress;
  final String? gstNumber;
  final String role;
  final DateTime? createdAt;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.storeName,
    this.storeAddress,
    this.gstNumber,
    this.role = 'STORE_OWNER',
    this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String? ?? json['_id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      storeName: json['storeName'] as String?,
      storeAddress: json['storeAddress'] as String?,
      gstNumber: json['gstNumber'] as String?,
      role: json['role'] as String? ?? 'STORE_OWNER',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'storeName': storeName,
      'storeAddress': storeAddress,
      'gstNumber': gstNumber,
      'role': role,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? storeName,
    String? storeAddress,
    String? gstNumber,
    String? role,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      storeName: storeName ?? this.storeName,
      storeAddress: storeAddress ?? this.storeAddress,
      gstNumber: gstNumber ?? this.gstNumber,
      role: role ?? this.role,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
